#!/usr/bin/env python
# coding: utf-8



##################################################################################################
##################################################################################################


### This file and the source code provided can be used only for the projects and assignments  
### of this course

### Last Edit by Dr. Atef Bader: 3/17/2021


##################################################################################################


# ## Divvy
# 
# **Divvy** is a bicycle sharing system in the City of Chicago.
# 
# Click __[here](https://en.wikipedia.org/wiki/Divvy)__ to read more about **Divvy**
# 
# 
# Click __[here](https://www.divvybikes.com/)__ to visit the official website for **Divvy**
# 

# This script will send a heartbeat every 2 minutes to divvy to collect their stations status in the City of Chicago.

# ### PostgreSQL
# 
# We will collect the data from **Divvy** servers and store the data in a table on **PostgreSQL** server.
# 
# This python script will send a heartbeat to Divvy every 2 minutes to retrieve the  status of the Divvy dock stations and store the data on PostgreSQL server.
# 
# You need the package **psycopg2** to Connect to **PostgreSQL** server.
# 
# Execute the **pip install** command from the command window to install  the package listed bove:
# - pip install psycopg2



import json
import requests
import datetime
import time
import os
import psycopg2
import pandas as pd
from urllib.request import urlopen
import json
import csv
from pprint import pprint
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT 
from datetime import datetime




from elasticsearch import Elasticsearch, helpers 

#es = Elasticsearch()
es=Elasticsearch('http://chicago:msdsdata@129.105.248.25:9200')




def set_data(input_file, index_name = "divvy_station_logs", doc_type_name="log"):
    for line in input_file:
        
        yield {
            "_index": index_name,
            "_type": doc_type_name,
            "_source": line
            
        }




def load(es, input_file, **kwargs):
    success, _ = helpers.bulk(es, set_data(input_file, **kwargs))




# Get divvy statations status
# Status is returned as a json reply

# response = urlopen('https://feeds.divvybikes.com/stations/stations.json')

response_stations_info = urlopen('https://gbfs.divvybikes.com/gbfs/en/station_information.json')

response = urlopen('https://gbfs.divvybikes.com/gbfs/en/station_status.json')

# Extract the body of the reply
response_body = response.read()
response_stations_info = response_stations_info.read()

# Decode the format in json format
stations_json = json.loads(response_body.decode("utf-8"))
stations_info_json = json.loads(response_stations_info.decode("utf-8"))




pprint(stations_json)




pprint(stations_info_json)







#db_connection = psycopg2.connect(host='127.0.0.1',dbname="postgres", user="root" , password="root")

db_connection = psycopg2.connect(host='129.105.248.26',dbname="postgres", user="chicago" , password="msdsdata")





db_connection.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT) 

cursor = db_connection.cursor()




# uncomment the following line if you already created the database 
# Only once you need to create the database

# cursor.execute("CREATE DATABASE chicago_divvy_stations_status;")
# db_connection.commit()





db_connection = psycopg2.connect(host='129.105.248.26',dbname="chicago_divvy_stations_status", user="chicago" , password="msdsdata")

cursor = db_connection.cursor()




# Only once you need to create the postgis extension.
# Comment the following line if you already created the postgis extension

# cursor.execute("CREATE EXTENSION postgis;")




db_connection.commit()




cursor.execute("DROP TABLE IF EXISTS divvy_stations_realtime_status")




db_connection.commit()




cursor.execute("""CREATE TABLE divvy_stations_realtime_status(
                altitude FLOAT,
                availableBikes INTEGER,
                availableDocks INTEGER,
                city TEXT,
                id BIGINT,
                is_renting BOOLEAN,
                kioskType TEXT,
                landMark TEXT,
                lastCommunicationTime timestamp,
                latitude FLOAT,
                location TEXT,
                longitude FLOAT,
                postalCode INTEGER,
                stAddress1 TEXT,
                stAddress2 TEXT,
                stationName TEXT,
                status TEXT,
                statusKey INTEGER,
                statusValue TEXT,
                testStation BOOLEAN,
                totalDocks INTEGER,
                Where_IS GEOGRAPHY);""")




db_connection.commit()


# ### The following is the Heartbeat Loop - Pulls data from divvy every 2 minutes in order to get realtime updates for the different divvy stations




while True:
    # Get divvy statations status
    # Status is returned as a json reply

    response_stations_info = urlopen('https://gbfs.divvybikes.com/gbfs/en/station_information.json')

    response = urlopen('https://gbfs.divvybikes.com/gbfs/en/station_status.json')

    # Extract the body of the reply
    response_body = response.read()
    response_stations_info = response_stations_info.read()

    # Decode the format in json format
    stations_json = json.loads(response_body.decode("utf-8"))
    stations_info_json = json.loads(response_stations_info.decode("utf-8"))
    
    
    stations_dictionary = stations_json['data']
    stations_info_dictionary = stations_info_json['data']
    
    # load data file into a dataframe
    df__stations = pd.DataFrame(stations_dictionary['stations'])
    df__stations_info = pd.DataFrame(stations_info_dictionary['stations'])
    
    divvy_stations_realtime_status = pd.DataFrame(columns=[
                'altitude',
                'availableBikes',
                'availableDocks',
                'city',
                'id',
                'is_renting',
                'kioskType',
                'landMark',
                'lastCommunicationTime',
                'latitude',
                'location',
                'longitude',
                'postalCode',
                'stAddress1',
                'stAddress2',
                'stationName',
                'status',
                'statusKey',
                'statusValue',
                'testStation',
                'totalDocks' ])
    
    for x in range(len(df__stations.index)):
        has_kiosk = df__stations_info['has_kiosk'][df__stations_info['station_id'] == df__stations['station_id'].iloc[x] ].values[0]
        row = [
            int(0),
            int(df__stations['num_bikes_available'].iloc[x]),
            int(df__stations['num_docks_available'].iloc[x]),
            'Chicago',
            int(df__stations['station_id'].iloc[x]),
            bool(df__stations['is_renting'].iloc[x]),
            has_kiosk,
            'Chicago',
            datetime.strptime(time.ctime(int(df__stations['last_reported'].iloc[x])), "%a %b %d %H:%M:%S %Y").strftime("%Y-%m-%d %H:%M:%S"),
            float(df__stations_info['lat'][df__stations_info['station_id'] == df__stations['station_id'].iloc[x] ].values[0]),
            'Chicago',
            float(df__stations_info['lon'][df__stations_info['station_id'] == df__stations['station_id'].iloc[x] ].values[0]),
            60602,
            'Chicago',
            'Chicago',
            df__stations_info['name'][df__stations_info['station_id'] == df__stations['station_id'].iloc[x] ].values[0],
            'IN_SERVICE',
            1,
            'IN_SERVICE',
            False,
            int(df__stations_info['capacity'][df__stations_info['station_id'] == df__stations['station_id'].iloc[x] ].values[0])]
    
        divvy_stations_realtime_status.loc[len(divvy_stations_realtime_status)] = row

        
    divvy_stations_realtime_status['altitude'] = divvy_stations_realtime_status['altitude'].astype(float)
    divvy_stations_realtime_status['availableBikes'] = divvy_stations_realtime_status['availableBikes'].astype(int)
    divvy_stations_realtime_status['availableDocks'] = divvy_stations_realtime_status['availableDocks'].astype(int)
    divvy_stations_realtime_status['city'] = divvy_stations_realtime_status.city.astype(str)
    divvy_stations_realtime_status['id'] = divvy_stations_realtime_status['id'].astype('int64')
    divvy_stations_realtime_status['is_renting'] = divvy_stations_realtime_status['is_renting'].astype(bool)
    divvy_stations_realtime_status['kioskType'] = divvy_stations_realtime_status['kioskType'].astype(str)
    divvy_stations_realtime_status['landMark'] = divvy_stations_realtime_status['landMark'].astype(str)
    divvy_stations_realtime_status['lastCommunicationTime'] = divvy_stations_realtime_status['lastCommunicationTime'].astype(str)
    divvy_stations_realtime_status['latitude'] = divvy_stations_realtime_status['latitude'].astype(float)
    divvy_stations_realtime_status['location'] = divvy_stations_realtime_status['location'].astype(str)
    divvy_stations_realtime_status['longitude'] = divvy_stations_realtime_status['longitude'].astype(float)
    divvy_stations_realtime_status['postalCode'] = divvy_stations_realtime_status['postalCode'].astype(int)
    divvy_stations_realtime_status['stAddress1'] = divvy_stations_realtime_status['stAddress1'].astype(str)
    divvy_stations_realtime_status['stAddress2'] = divvy_stations_realtime_status['stAddress2'].astype(str)
    divvy_stations_realtime_status['stationName'] = divvy_stations_realtime_status['stationName'].astype(str)
    divvy_stations_realtime_status['status'] = divvy_stations_realtime_status['status'].astype(str)
    divvy_stations_realtime_status['statusKey'] = divvy_stations_realtime_status['statusKey'].astype(int)
    divvy_stations_realtime_status['statusValue'] = divvy_stations_realtime_status['statusValue'].astype(str)
    divvy_stations_realtime_status['testStation'] = divvy_stations_realtime_status['testStation'].astype(bool)
    divvy_stations_realtime_status['totalDocks'] = divvy_stations_realtime_status['totalDocks'].astype(int)
    
    # lets store our data subset into a file
    # This way you have a copy of data stored in a file 
    # that you could use in case you want to debug a problem on the orginal data received

    divvy_stations_realtime_status.to_csv('divvy_stations_status.csv',sep=',', encoding='utf-8', index=False)
    
    # delete existing data in the table
    cursor.execute("DELETE FROM divvy_stations_realtime_status")
    db_connection.commit()

    
    # Now we will connect to the database and store divvy data
    with open('divvy_stations_status.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip the header row.
        for row in reader:
            cursor.execute( "INSERT INTO divvy_stations_realtime_status VALUES (%s, %s, %s, %s, %s,    %s, %s, %s, %s,%s,   %s, %s, %s, %s,%s,   %s, %s, %s, %s,%s,  %s, NULL)", row)

    
    
    db_connection.commit()
    
    cursor.execute("UPDATE divvy_stations_realtime_status SET Where_IS = ST_POINT(latitude,longitude);")
    db_connection.commit()
    
    
    # Now we will connect to ElasticSearch database and store divvy data
    divvy_stations_realtime_status = divvy_stations_realtime_status.to_json(orient='records')
    divvy_stations_realtime_status = json.loads(divvy_stations_realtime_status)
    load(es,divvy_stations_realtime_status)
    
    
    # Sleep for 3 minutes; divvy updates its stations status every 2 minutes
    now = datetime.now()
    timedate = ( (str(now.now())).split('.')[0]).split(' ')[0] + ' ' + ((str(now.now())).split('.')[0]).split(' ')[1]
 
    print(timedate, ' : Sent Heartbeat to Divvy Servers and Going to sleep for 2 minutes now ...')
    time.sleep(120)    
    continue
       




# close connection at the end of the script

db_connection.close()






