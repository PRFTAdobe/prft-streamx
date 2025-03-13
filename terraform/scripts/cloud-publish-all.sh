SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pushd "${SCRIPT_DIR}/../../" || exit

export QUARKUS_PROFILE=cloud,cms && streamx batch publish data
#export QUARKUS_PROFILE=cloud,pim && streamx stream data data/catalog/products.stream
#export QUARKUS_PROFILE=cloud,pim && streamx stream data data/catalog/categories.stream
# export QUARKUS_PROFILE=cloud,cms && streamx stream renderers ../lumaxscript/unpublish-renderers.stream
# pim (data channel), cms (renderers),

popd || exit
