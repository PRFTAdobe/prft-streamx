SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pushd "${SCRIPT_DIR}/../" || exit

streamx publish events data
streamx publish stream data/catalog/categories.stream -b 100
streamx publish stream data/catalog/products.stream -b 100

popd || exit
