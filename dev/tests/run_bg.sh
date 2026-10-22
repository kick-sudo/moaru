#!/bin/bash
# run_bg.sh spec1 [spec2 ...] : runs the play.py specs two at a time; writes _tests/out_<spec>.txt; prints ALLDONE at the end
cd "$(dirname "$0")/.."
run() { local s=$1; local b=$(basename $s .json); timeout 3600 python3 play.py $s > _tests/out_${b#t_}.txt 2>&1; echo "finished $b"; }
while [ $# -gt 0 ]; do
  run $1 & p1=$!
  if [ $# -gt 1 ]; then run $2 & p2=$!; wait $p2; fi
  wait $p1
  shift; shift
done
echo ALLDONE
