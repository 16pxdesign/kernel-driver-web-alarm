#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/gpio.h>
#include <linux/device.h>
#include <linux/uaccess.h>
#include <linux/timer.h>
#include <linux/interrupt.h>
#include <linux/string.h>
#include <linux/ktime.h>



#define DEVICE_NAME "msecurity"
#define MAJOR 42

#define BUFF_SIZE 32

//gpio
static unsigned int Button = 26; 
static unsigned int Led = 17;
static unsigned int Resistor = 21; 
static unsigned int Buzzer = 19;
static unsigned int Pir = 6; 
static unsigned int Door = 20; 

//irqs
static unsigned int IrqButton = 0;
static unsigned int IrqPir = 0;
static unsigned int IrqDoor = 0;
static unsigned int IrqResistor = 0;

//vairables
static int armed = 0; //0 off, 1 on, 2 soft
static bool alarm = false;
struct timer_list flash_timer;
static bool DEV = false;

//message to userland variables
char *message = "";
static DECLARE_WAIT_QUEUE_HEAD(wq);
static int flag = 0;

//iocl commands
#define IOCTL_DEFUSE 0x10
#define IOCTL_ARM 0x20

#define IOCTL_GET_STATUS 0x30
//#define IOCTL_ACTIVE 0x40
#define IOCTL_ACTIVE_SOFT 0x41

static bool active = true; //for driver reads - active message sending (auto false after send)

/////////test ioCTL data
typedef struct gpiodevice {
	unsigned char action[256];
    int value;
} gpiodevice;
gpiodevice devicedata;

//test_debounce
unsigned long old_jiffie = 0;

//awaike write and send message
static void awaike_for_message(char* msg){
    *message = kmalloc(strlen(msg)+1, GFP_KERNEL);
    strcpy(message,msg);
    printk(KERN_INFO "Process %i (%s) send awake\n", current->pid, current->comm);   
    flag = 1;
    wake_up_interruptible(&wq);
}

//flash timmer
static void flash_led(struct timer_list *timer){
    printk("flash_timer iteration");
    if(alarm) //if alarm is on set next interval
    mod_timer(&flash_timer, jiffies + msecs_to_jiffies(1000)); //ative next loop of timer
    //change led state
    uint8_t state = gpio_get_value(Led);
    gpio_set_value(Led,!state);
    gpio_set_value(Buzzer,!state);

    if(!alarm)
    gpio_set_value(Led,0); //if alarm off need to disable led (async)
    gpio_set_value(Buzzer,0);
    if(alarm)
    awaike_for_message("ALARM");
}
//active alarm on call
static void active_alarm(void){
    if(armed){
    if(!alarm){
        alarm = true;
        //flash led timer
        timer_setup(&flash_timer, flash_led, 0);
        mod_timer(&flash_timer, jiffies + msecs_to_jiffies(1000)); //start first timer loop
        
    }
    }
}
//decide to active alarm on device type
static void trigger_alarm(unsigned int* activator){
    printk("trigger_alarm\n");
    printk("val %ld \n", activator);
    bool action = false;

    switch(armed){
        case 0:
        printk("No action\n");
        break;

        case 1:
        printk("Active alarm\n");
        active_alarm();
        action = true;
        break;

        case 2:
        if(activator != Pir){
            printk("Active soft alarm\n");
            active_alarm();
            action = true;
            break;
        }
        printk("No action soft\n");
        break;
    }

}

static void arm_alarm(unsigned int activator){
    printk("arm_alarm\n");
    printk("val %ld \n", activator);
    if(activator == Button){
        printk("arm_alarm by button\n");
        armed = 1;

        
    }else if(activator == Resistor){
        printk("arm_alarm by resistor (soft alarm)\n");
        armed = 2;
    }else{
        printk("Active by software"); 
        armed = 1;
    }

    if(armed == 1)
    awaike_for_message("ARM");
    if(armed == 2)
    awaike_for_message("SOFT");

}

static void un_arm_alarm(void){
    armed = 0;
    if(alarm){
        alarm =false;
        gpio_set_value(Led,0);
        gpio_set_value(Buzzer,0);
        awaike_for_message("UNALARM");
    }
    
    awaike_for_message("UNARM");
}


static int msecurity_open(struct inode *inodep, struct file *filep){
    printk(KERN_INFO "Device opened");
    return 0;
}

static long msecurity_ioctl(struct file *filep, unsigned int cmd, unsigned long arg){
    printk("msecurity_ioctl 0x%x \n", cmd);

    switch(cmd){
        case IOCTL_ARM:
            printk("Arm alarm via ioctl");
            arm_alarm(0);
            return 1;
            break;
        case IOCTL_DEFUSE:
            printk("Defuse alarm via ioctl");
            un_arm_alarm();
            return 1;
            break;
        case IOCTL_GET_STATUS:
            copy_from_user(&devicedata, (gpiodevice *)arg, sizeof(devicedata));
            printk(devicedata.action);
            printk("ok");
            if(strcmp(devicedata.action,"ALARM")== 0)
                devicedata.value = alarm?1:0;
            if(strcmp(devicedata.action,"ARM")== 0)
                devicedata.value = armed;
            copy_to_user((void *)arg, &devicedata, sizeof(devicedata));
            break;
        case IOCTL_ACTIVE_SOFT:
            printk("Soft alarm via ioctl");
            arm_alarm(Resistor);
            return 1;
            break;

    }



    return 0;
}

static ssize_t msecurity_write(struct file *filep, const char *buffer, size_t len, loff_t *offset){
  
    /* for testing propose
    char chars[len+1];
    if(copy_from_user(chars,buffer,len)){
        return -EFAULT;
    }
    chars[len]='\0';

    printk(KERN_ALERT "Output> %s", chars);
    active = false;

    return len;

    */

    return -EINVAL;
 
}

static ssize_t msecurity_read(struct file *filep, char *buffer, size_t len, loff_t *offset){
    
    printk(KERN_INFO "Process %i (%s) go sleep...\n", current->pid, current->comm);
    wait_event_interruptible(wq, flag != 0);
    if(flag>0)
        flag=flag-1;
    printk(KERN_INFO "Process %i (%s) has been aveked\n", current->pid, current->comm);
        
    int errors = 0;
    
    int message_len = strlen(message);
    //int tttt = 55;
    //message_len = sizeof(tttt);
    errors = copy_to_user(buffer, message, message_len);
    printk("message sent\n");

    return errors == 0 ? message_len : -EFAULT;
}

static int msecurity_release(struct inode *inodep, struct file *filep){
    printk(KERN_INFO "Device msecurity_release\n");
    return 0;
}

static struct file_operations fops = {
    .open = msecurity_open,
    .read = msecurity_read,
    .write = msecurity_write,
    .release = msecurity_release,
    .unlocked_ioctl = msecurity_ioctl,
};

static irq_handler_t irq_door(unsigned int irq, void *dev_id, struct pt_regs *regs){
    printk("irq_door\n");
    //trigger alarm if door are opened
    if(gpio_get_value(Door)==1){ 
        trigger_alarm(Door);
    }  

    awaike_for_message("DOOR");
   return (irq_handler_t) IRQ_HANDLED;
}

static irq_handler_t irq_pir(unsigned int irq, void *dev_id, struct pt_regs *regs){
    printk("irq_pir\n");

    //trigger alarm if pir detect motion
    if(gpio_get_value(Pir)==1){ 
        trigger_alarm(Pir);
    }    

    awaike_for_message("PIR");

    return (irq_handler_t) IRQ_HANDLED;
    /* for testing propose
    uint8_t value;
    value = gpio_get_value(Door);
    printk("val %ld \n", value);
    
    uint8_t led_value = gpio_get_value(Led);
    gpio_set_value(Led, !led_value);
    */
  
}

static irq_handler_t irq_resistor(unsigned int irq, void *dev_id, struct pt_regs *regs){

    unsigned long out = jiffies - old_jiffie;

    if ((out > 1000))
    {
        awaike_for_message("RESISTOR");
        //auto arm-alaram - no pir
        if (armed==0)
            arm_alarm(Resistor);

        old_jiffie = jiffies;
        return (irq_handler_t) IRQ_HANDLED;
    }




   return (irq_handler_t) IRQ_HANDLED;
}

static irq_handler_t irq_button(unsigned int irq, void *dev_id, struct pt_regs *regs){
    printk("irq_button\n");
    //FIXME: 
    awaike_for_message("BUTTON");
    //for debuging only
    if(DEV){
        if(alarm){ 
            un_arm_alarm();
        }
    }

    //arm alarm on button click
    if(gpio_get_value(Button)==1){ 
        arm_alarm(Button);
    }  

    
   
   return (irq_handler_t) IRQ_HANDLED;
}


static int __init msecurity_init(void){



    //register device
    int dev = register_chrdev(MAJOR,DEVICE_NAME,&fops);

    //check is devvice is registred
    if(dev < 0){
        printk(KERN_ALERT "Fail to load driver\n");
        return dev;
    }

    //Check GPIO valid
    if (!gpio_is_valid(Door)){
    printk(KERN_INFO "Door: gpio_is_valid\n");
    return -ENODEV;
   }
    if (!gpio_is_valid(Pir)){
    printk(KERN_INFO "Pir: gpio_is_valid\n");
    return -ENODEV;
   }
    if (!gpio_is_valid(Resistor)){
    printk(KERN_INFO "Resistor: gpio_is_valid\n");
    return -ENODEV;
   }
    if (!gpio_is_valid(Button)){
    printk(KERN_INFO "Resistor: gpio_is_valid\n");
    return -ENODEV;
   }
   if (!gpio_is_valid(Buzzer)){
    printk(KERN_INFO "Buzzer: gpio_is_valid\n");
    return -ENODEV;
   }

//FIXME: https://raspberrypi.stackexchange.com/questions/55283/why-isnt-gpio-set-debounce-working-in-my-raspberry-pi-zero-kernel-module
    //register GPIO
    gpio_request(Led, "Led");
    gpio_direction_output(Led, 0);
    gpio_export(Led, false);

    gpio_request(Buzzer, "Buzzer");
    gpio_direction_output(Buzzer, 0);
    gpio_export(Buzzer, false);

    gpio_request(Door, "Door");
	gpio_direction_input(Door);
   	gpio_set_debounce(Door, 2000);
	gpio_export(Door, false);
    
    gpio_request(Pir, "Pir");
	gpio_direction_input(Pir);
   	gpio_set_debounce(Pir, 200);
	gpio_export(Pir, false);


    gpio_request(Resistor, "Resistor");
	gpio_direction_input(Resistor);
   	gpio_set_debounce(Resistor, 1);
	gpio_export(Resistor, false);
  

    gpio_request(Button, "Button");
	gpio_direction_input(Button);
   	gpio_set_debounce(Button, 200);
	gpio_export(Button, false);
   
    //register irqs
    IrqResistor = gpio_to_irq(Resistor);
    request_irq(IrqResistor, (irq_handler_t) irq_resistor, IRQF_TRIGGER_RISING, "irq_resistor", NULL);

    IrqDoor = gpio_to_irq(Door);
    request_irq(IrqDoor, (irq_handler_t) irq_door, IRQF_TRIGGER_RISING | IRQF_TRIGGER_FALLING, "irq_door", NULL);

    IrqPir = gpio_to_irq(Pir);
    request_irq(IrqPir, (irq_handler_t) irq_pir, IRQF_TRIGGER_RISING, "irq_pir", NULL);

    IrqButton = gpio_to_irq(Button);
    request_irq(IrqButton, (irq_handler_t) irq_button, IRQF_TRIGGER_RISING, "irq_button", NULL);

    printk(KERN_ALERT "Module inited\n");
    return 0;
}

static void __exit msecurity_exit(void){

    del_timer(&flash_timer);
    free_irq(IrqButton, NULL);
    gpio_unexport(Button);
    gpio_free(Button);
    free_irq(IrqDoor, NULL);
    gpio_unexport(Door);
    gpio_free(Door);
    free_irq(IrqPir, NULL);
    gpio_unexport(Pir);
    gpio_free(Pir);
    free_irq(IrqResistor, NULL);
    gpio_unexport(Resistor);
    gpio_free(Resistor);
    gpio_set_value(Led, 0);
    gpio_unexport(Led);
    gpio_free(Led);
    gpio_set_value(Buzzer, 0);
    gpio_unexport(Buzzer);
    gpio_free(Buzzer);
    printk(KERN_ALERT "Bye world\n");
    //undergister device
    unregister_chrdev(MAJOR,DEVICE_NAME);
}

module_init(msecurity_init);
module_exit(msecurity_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("AR");
MODULE_DESCRIPTION("Abertay mProject");
MODULE_VERSION("0.2");