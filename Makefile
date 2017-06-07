export NODE_ENV = test

build: test-clean
	yarn build

test: test-clean
	yarn test

clean: test-clean
	rm -rf coverage
	rm -rf yarn-error*

test-clean:
	rm -rf packages/*/__tests__/tmp

clean-all:
	rm -rf node_modules
	make clean

bootstrap: clean-all
	yarn