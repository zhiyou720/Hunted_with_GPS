# Hunted_with_GPS

## enviroment setup

$cd Hunted_with_GPS
$pip install -r requirements_test.txt

## run application

$cd Hunted_with_GPS  
$export FLASK_APP=hunted.py  
$export FLASK_DEBUG=1  
$flask run  

Then http://localhost:5000

## run with docker 
$docker build -t flasky:latest .

$docker run --name hunted -d -p 8000:5000 -e SECRET_KEY=5a8b9f1b2fc9459a8c16288810e1403c -e MAIL_USERNAME=youremail -e MAIL_PASSWORD=password hunted:latest
