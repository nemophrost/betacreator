#######################################
# Makefile-specific variables         #
#######################################

SHELL = /bin/bash -e
MAKEFLAGS = -j 4

#######################################
# Other Variables                     #
#######################################

CALCDEPS := js/closure/closure/bin/calcdeps.py
CLOSUREBUILDER := js/closure/closure/bin/build/closurebuilder.py
COMPILED_JS_SOURCES = $(shell find js/betacreator -type f -name "*.js")

LESSC := tools/less/bin/lessc
LESS_FILES := $(shell find css/ -name "*.less")
LESS_CSS_SOURCES := $(shell find css/ -name "*.less" -a -not -name "_*.less")
LESS_CSS_COMPILED := $(subst .less,.css,$(LESS_CSS_SOURCES))


#######################################
# Common Targets                      #
#######################################

.DELETE_ON_ERROR:
.DEFAULT: help

.PHONY: help
help:
	@echo "### MAKE TARGETS ###"
	@echo "  help                    Print this help"
	@echo "  js                      Compile the JavaScript sources to create the minified and optimized betacreator.js"
	@echo "  css                     Less CSS Compiler"
	@echo "  deps                    Generate the JavaScript dependency file"
	@echo "  clean                   Clean all targets"
	@echo "  clean-js                Clean js target"
	@echo "  clean-css               Clean CSS"
	@echo "  clean-deps              Clean deps target"

.PHONY: clean
clean: clean-js clean-css clean-deps


#######################################
# JS (closure) Functions              #
#######################################

# compilejs
# Compiles an application file
#
# $(1) = intermediate file prefix (source-map, var-map)
# $(2) = application file(s)
# $(3) = output file
compilejs = $(CLOSUREBUILDER)                                                        \
            --root=js                                                                \
            $(foreach app,$(2),-i $(app))                                            \
            -o compiled                                                              \
            -c tools/compiler/compiler.jar                                           \
            -f "--compilation_level=ADVANCED_OPTIMIZATIONS"                          \
            -f "--warning_level=VERBOSE"                                             \
            -f "--externs=js/externs/jquery.js"                                      \
            -f "--jscomp_error=accessControls"                                       \
            -f "--jscomp_error=checkRegExp"                                          \
            -f "--jscomp_error=checkTypes"                                           \
            -f "--jscomp_error=checkVars"                                            \
            -f "--jscomp_error=deprecated"                                           \
            -f "--jscomp_error=fileoverviewTags"                                     \
            -f "--jscomp_error=invalidCasts"                                         \
            -f "--jscomp_error=missingProperties"                                    \
            -f "--jscomp_error=nonStandardJsDocs"                                    \
            -f "--jscomp_error=strictModuleDepCheck"                                 \
            -f "--jscomp_error=undefinedVars"                                        \
            -f "--jscomp_error=unknownDefines"                                       \
            -f "--jscomp_error=visibility"                                           \
            -f "--js=js/bin/deps.js"                                                 \
            -f "--create_source_map=js/bin/$(1)-source-map"                          \
            -f "--variable_map_output_file=js/bin/$(1)-var-map"                      \
            -f "--output_wrapper=\"(function() {%output%})();\""                     \
            --output_file=$(3);


#######################################
# JS (closure) Targets                #
#######################################

.PHONY: deps clean-deps
deps: js/bin/deps.js
clean-deps:
	rm -f js/bin/deps.js

js/bin/deps.js: $(COMPILED_JS_SOURCES)
	$(CALCDEPS)                                       \
	-i js/betacreator/Client.js                       \
	-p js                                             \
	-o deps                                           \
	--output_file=$@

.PHONY: js clean-js
js: js/bin/betacreator.js
clean-js:
	rm -f js/bin/betacreator.js                              \
	      app/webroot/js/closure/bin/betacreator-source-map  \
	      app/webroot/js/closure/bin/betacreator-var-map

js/bin/betacreator.js: js/bin/deps.js
	$(call compilejs,betacreator,js/betacreator/Client.js,$@.tmp)
	cat tools/COPYRIGHT $@.tmp > $@
	rm $@.tmp


#######################################
# CSS Targets                         #
#######################################

.PHONY: css clean-css clean-css-compiled
css: $(LESS_CSS_COMPILED)
clean-css: clean-css-compiled
clean-css-compiled:
	rm -f $(LESS_CSS_COMPILED)

.SECONDARY: $(LESS_CSS_COMPILED)
css/%.css: css/%.less $(LESS_FILES)
	$(LESSC) $< -x > $@
