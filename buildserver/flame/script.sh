rm -f out.* node-flame.svg perf.data* *.log

echo "Profiling for 30 seconds"
pid="$(pgrep -n node)"
perf record -p "${pid}" -i -g -e cycles:u -- sleep 20

echo "Profiling done. Creating Flame Graph"
perf script | egrep -v "( __libc_start| LazyCompile | v8::internal::| Builtin:| Stub:| LoadIC:|\[unknown\]| LoadPolymorphicIC: | Handler:| CallIC:| StorePolymorphicIC:| KeyedStorePolymorphicIC:)" | sed 's/ LazyCompile:[*~]\?/ /' | ./FlameGraph/stackcollapse-perf.pl > out.folded
# perf script > out.perf
# sed -i '/\[unknown\]/d' out.perf
# ./FlameGraph/stackcollapse-perf.pl < out.perf > out.folded
./FlameGraph/flamegraph.pl out.folded > node-flame.svg
