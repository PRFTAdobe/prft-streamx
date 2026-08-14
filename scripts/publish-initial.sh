SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pushd "${SCRIPT_DIR}/../" || exit

streamx publish stream data/initial/assets1.stream
streamx publish stream data/initial/assets2.stream
streamx publish stream data/initial/data.stream -b 100
streamx publish stream data/initial/fragments.stream -b 100
streamx publish stream data/initial/pages.stream -b 100
streamx publish stream data/initial/web-resources.stream -b 100

popd || exit
