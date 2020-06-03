# Go back to root directory
cd ..

# Install dependencies
yarn install

# Zip main lambda layer folder if it does not exists
MAIN_LAYER=main_layer.zip
if [ -f "$MAIN_LAYER" ]; then
    echo "$MAIN_LAYER exist"
else
    echo "$MAIN_LAYER does not exist"
    zip -r $MAIN_LAYER node_modules/
fi
