Total Recall
=========

LIVE VERSION:
http://ec2-54-81-232-7.compute-1.amazonaws.com/
JAVA REPO:
https://github.com/JohnMarsh/OpenDataJava

This is our submission for the Canadian Open Data Experience 2014 Hackathon.  There is also a repo called OpenDataJava which has the Java code for our server processors.  This repo contains the web server (node.js) code for displaying the GUI and for subscribing for notifications.  Please note a lot of the time went into the back end processors rather than the GUI, hence the medicore design.

About The App
----
This app allows users to subscribe to a data set (e.g. the car recall dataset, or the border wait time data set) and receive updates for when data is added that matches the users defined criteria.  So for example, I can subscribe to the border wait time data set and specify that I want to be notified whenever the U.S. bound commercial wait time is less than 10 minutes at the Cornwall border.  The user can specify as many mappings as there are columns for the data set.  So if I were to subscribe to my previous example, whenever the border wait time for Cornwall is less than 10 minutes, I would receive an email notifying me of the current wait time.  

Currently we only implemented the 2 data sets, but there is future possibility of including MANY more data sets that would be more useful.  These 2 data sets were only selected to broadcast our idea, and the fact that our system actually works.  


How It Works
---
Our Java processors run periodically and grab the data sets from the Government of Canada website.  We then add any records of the data that are not already in our system to our database.  We then have a seperate processor which looks at users who have defined a mapping to receive notifications, and it matches that against new data in our database.  If the mapping holds to be true, we generate a email.  Everything is designed to be extremely dynamic.  A new dataset can be added with almost no code changes.  The only code that needs to be written is a custom method for parsing the data set since every data set has a different format.


What we didn't have time to finish
---
On the server side we implemented searching for all of our data.  We did not have a chance to build it into the GUI though.  That would've been nice.  Also, we are pretty limited to how many emails can be sent out since we don't have access to a production SMTP server.  We also wanted to include a couple more data sets.  We also woudl like to drastically improve the GUI.


What We Used
---
node.js
Java
MySQL
Amazon EC2 and RDS


Screenshots:
---
![Alt text](/screenshots/Screen Shot 2014-03-02 at 3.41.22 PM.png)

![Alt text](/screenshots/Screen Shot 2014-03-02 at 3.41.28 PM.png)

![Alt text](/screenshots/Screen Shot 2014-03-02 at 3.41.49 PM.png)

![Alt text](/screenshots/Screen Shot 2014-03-02 at 3.41.59 PM.png)
