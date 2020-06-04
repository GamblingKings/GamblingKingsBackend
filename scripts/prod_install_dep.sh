# Go back to root directory
cd ..

# Remove the layer folder
LAYER_FODLER=lambda_layer
if [ -d "$LAYER_FODLER" ]; then
    echo "Removing $LAYER_FODLER"
    rm -rf $LAYER_FODLER
fi

# Copy package.json into layer folder
mkdir $LAYER_FODLER && cd $LAYER_FODLER
mkdir nodejs && cd nodejs/
cp ../../package.json ./

# Install production dependencies
yarn install --prod

# Go back to root directory
cd ../../

# Remove zip file if exists
MAIN_LAYER=lambda_layer.zip
if [ -f "$MAIN_LAYER" ]; then
    echo "Removing $MAIN_LAYER"
    rm -rf $MAIN_LAYER
fi

# Zip layer folder into lambda_layer.zip
zip -r $MAIN_LAYER $LAYER_FODLER/nodejs/
