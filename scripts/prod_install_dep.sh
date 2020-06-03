# Copy package.json into layer folder
cd ../layer/nodejs/
cp ../../package.json ./

# Install production dependencies
yarn install --prod

# Remove zip file if exists
MAIN_LAYER=main_layer.zip
if [ -f "../../$MAIN_LAYER" ]; then
    echo "Removing $MAIN_LAYER"
    rm -rf ../../$MAIN_LAYER
fi

# Zip main lambda layer folder
zip -r ../../$MAIN_LAYER ./
