obj-m += msecurity.o

KERNEL = /usr/src/linux-headers-5.4.0-56-generic


all:
	make -C $(KERNEL) M=$(PWD) modules
cross:
	make ARCH=arm CROSS_COMPILE=$(CROSS) -C $(KERNEL) M=$(PWD) modules
clean:
	make -C $(KERNEL) M=$(PWD) clean