Failed:

```bash
em++ -sSHARED_MEMORY=1 -sALLOW_MEMORY_GROWTH=1 --js-library=library_napi.js -v -o out/myobject.js emnapi.c myobject.cc main.cc
```

Success:

```bash
em++ -sALLOW_MEMORY_GROWTH=1 --js-library=library_napi.js -v -o out/myobject.js emnapi.c myobject.cc main.cc
```
