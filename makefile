BIN := mfetch
SRC := main.ts
DENO := /root/.deno/bin/deno

PERMS := \
	--allow-run=id,hostname,uname,uptime,cat \
	--allow-read=/etc/os-release \
	--allow-env=SHELL

.PHONY: all build run clean

all: build

build:
	$(DENO) compile \
		--output $(BIN) \
		$(PERMS) \
		$(SRC)

run:
	$(DENO) run \
		$(PERMS) \
		$(SRC)

clean:
	rm -f $(BIN)
