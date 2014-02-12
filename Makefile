.PHONY: all clean install

all: install

install:
	npm install

clean:
	rm -rf node_modules
