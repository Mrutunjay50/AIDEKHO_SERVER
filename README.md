
# Project Title

**_Ai Dekho_**
> Administrative Panel Integration

## Project Description:

**_Ai Dekho_** is an advanced web platform designed to serve as a comprehensive resource for exploring and learning about various AI tools. This project extends its functionality by seamlessly integrating a powerful administrative panel for efficient management tasks. The administrative panel empowers administrators with capabilities such as adding new tools, editing tool details, managing blogs, and overseeing the overall content of the website.


## Key Features:
### 1. Explore AI Tools:
##### o Users can effortlessly navigate through an extensive list of AI tools categorized for easy discovery.
##### o Detailed information, use cases, and features of each tool provide a rich learning experience.
### 2. Administrative Panel:
#### o User Management: 
Admins can manage user roles, permissions, and access levels for a secure environment.
#### o Tool Management: 
Easily add new AI tools, edit existing details, and organize them into relevant categories.
#### o Blog Management: 
Admins can create, edit, and remove blog posts to keep the content up-to-date and engaging.
#### o Dashboard Analytics: 
Gain insights into user interactions, popular tools, and overall website performance.


### 3. User-Friendly Interface:

The platform features an intuitive and user-friendly interface for both regular users and administrators.
Responsive design ensures a seamless experience across various devices.
### 4. Authentication and Security:

Robust authentication mechanisms secure the administrative panel, preventing unauthorized access.
Data encryption and secure API calls contribute to the overall security of the platform.
Scalable Architecture:

The project is built on a scalable architecture, allowing for easy expansion of features and accommodating a growing user base.


**_Ai Dekho_** with its integrated administrative panel provides an inclusive and interactive platform, catering to both AI enthusiasts and administrators responsible for managing and expanding the platform's content. Explore, learn, and contribute to the ever-growing world of AI tools on the AI Tool Hub.



## Installation

# Deployment

To deploy this project and run on AWS with free SSL

## Installation Intruction

Deployment Instructions for EC2 Instance Setup

## Create an EC2 Instance:

After successfully creating an EC2 instance, navigate to the AWS Management Console.
Click on the Instances section and find your newly created instance.

#### Instance Summary:

Click on the `Instance ID` to access the instance summary.

##### Connect to Instance:

On the instance summary page, locate the Connect button.

#### `CloudShell` Access for Windows Users:

Click `Connect` to access the "Connect to Instance" page.
On the new page, click on the `Connect` button located at the bottom.

##### `CloudShell` Access:

You will be redirected to the `CloudShell` of your EC2 instance.

## Deployment Commands:

Follow the commands below in `CloudShell` for a successful deployment:
Install node version manager (nvm) by typing the following at the command line.

```bash
    #to become a root user
    sudo su -
```

```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

#### Activate nvm by typing the following at the command line.

```bash
    . ~/.nvm/nvm.sh
```

Use nvm to install the latest version of Node.js by typing the following at the command line.

```bash
  nvm install node
```

### Now After Installing Node Lets Move To Installing Git In Our EC2 Server

##### To install git, run below commands in the terminal window:

```bash
  sudo apt-get update -y
```

```bash
  #sudo apt upgrade
  #sudo apt upgrade
  #sudo apt install -y git htop wget
  #well you don't have to get htop or wget until necessary so :
  sudo apt-get install git -y
```

now to ensure that git is installed type the follwing command:

```bash
  git --version
```

This command will print the git version in the terminal.

Now Clone Your Server Repository where you have your server code

```bash
  git clone https://github.com/clone-your-repo
```

now change the directory to your cloned folder or directory and install the packages in your `package.json` file:

```bash
  cd Brand_Monkey_Server
```

```bash
  npm install
```

to run the server:

```bash
  node app.js
```

### Install pm2

```bash
  npm install -g pm2
```

#### Starting the app with pm2 (Run nodejs in background and when server restart)

```bash
  pm2 start app.js
```

```bash
  pm2 save
```

the above command # saves the running processes # if not saved, pm2 will forget # the running apps on next boot

#### If you want pm2 to start on system boot :

```bash
  pm2 startup # starts pm2 on computer boot
```

Now all the steps required to run the server on EC2 is completed.

## Install Nginx For Proxy Setup And For Free SSL

```bash
sudo apt install nginx
```

```bash
sudo nano /etc/nginx/sites-available/default
```

### Add the following to the location part of the server block

##### before setting it up make sure you do not change anything but the `location` part:

```bash
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:8800; #whatever port your app runs on
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
```

check nginx config and restart it if no error occur :

```bash
sudo nginx -t
```

```bash
sudo service nginx restart
```

#### You should now be able to visit your IP with no port (port 80) and see your app. Now let's add a domain

#### This step is to point your ip address from the domain

     ->Check that Port 80 redirect to Nodejs server

#### In this step lets install free SSL using Certbot

##### Installing Certbot

```bash
sudo snap install core; sudo snap refresh core
```

```bash
sudo apt remove certbot
```

```bash
sudo snap install --classic certbot
```

```bash
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

lets finalise out Nginx's Configuration

```bash
sudo nano /etc/nginx/sites-available/default
```

```bash
server_name domain.com www.subdomain.com;
```

confirm it by the same testing command

```bash
sudo nginx -t
```

```bash
sudo systemctl reload nginx
```

Now Lets obtain the Free SSL Certificate:

```bash
sudo certbot --nginx -d domain.com -d iftwodomain.com
```

Now you have successfully applied the SSL to your domain

#### The last step is to set the certbot for auto-renewal

```bash
sudo systemctl status snap.certbot.renew.service
```

To test the renewal process, you can do a dry run with certbot:

```bash
sudo certbot renew --dry-run
```


## Screenshots
## 1.
![App Preview](/homepage01.png)
## 2.
![App Preview](/homepage02.png)



## Tech Stack

**Client:** React, ContextAPI, TailwindCSS, OAuth, jwt-decode, React Toast

**Server:** Node, Express, Multer, S3, AWS(EC2), jsonwebtoken, MongoDB, Mongoose 
