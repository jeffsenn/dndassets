# dndassets
Somewhat Secured Personal Assets (for Virtual Tabletop or other purposes)

This is a repository for hosting semi-private links to assets for my virtual tabletop. My own repo is private.  This is a template so that you can clone and roll your own.

I would like to share assets with players for my game - and the links need to be available without a complicated login process.

This is NOT SECURE!  It is intended for a website that has "security through obscurity" level privacy.  All assets are available if you know the URL.

## AboveVTT

I use this for the (spectacular) AboveVTT web extension https://github.com/cyruzzo/AboveVTT so that I have a source of URLs for image assets for maps and tokens.

If you do not want to go to the trouble of setting up stuff yourself, and you need cloud available storage, there are other options (dropbox... etc) and there may also be benefits to the AboveVTT patreon (https://www.patreon.com/abovevtt). You should probably check out the AboveVTT Discord (https://discord.gg/cMkYKqGzRh) for other options.


## Setup a Website

### Using this repo

1. Fork this repo on Github (or make a clone and then push it to your own origin)
1. Put copies of the resources you want into the `updates` directory (don't use sub-folders!, do use descriptive file names)
1. Create a passphrase in `passphrase.txt`
1. use `node update.js` to build and commit the site back to your repo
1. deploy your website from the committed repo (one option is CloudFlare)

Note: CloudFlare Pages does not present "directory style" pages for folder URLs -- make sure how ever you deploy does not provide this or the whole "security" mechanism here will just not work.  e.g. if users can see a directory: https://your-website.link/images/ then they can just see everything.

### At CloudFlare

1. You'll need a CloudFlare account
1. Go to Workers & Pages > Create application 
1. Click Connect to Github, jump through authentication hoops (may vary depending on how you have Github setup)
1. Select your GitHub repo (you probably want your repo private)
1. Accept all the defaults (eg Leave "Build Command" empty)
1. Click "Save and Deploy"

Theoretically this does everything to redeploy your site when you push to your repo.  However on a free account you may be limited in number of deployments in a time period, so commit judiciously.

### Updating/Adding Resources

1. Just add them to `updates/` directory 
1. Delete anything you don't want from `images/`
1. Re-run `node updates.js`  (moves files from `updates/` -> `images/`)

### Changing password

1. Change `passphrase.txt`
1. Re-run `node updates.js`

### How it works

The script assigns random names to the image/resource files and them moves them to the `images` directory.  It keeps a local (not committed) secret version of the index (with previous file names) in `secretindex.txt`.  This index is encrypted with the passphrase and deployed in `index.txt` with the website.  The script on the page will use a user entered passphrase to decrypt the index.

Of course only the admin needs the index -- direct links to the resources work as usual.

There is also some integration stuff (iframe message interaction) that is used to interact with AboveVTT - but you can ignore that if you are not using AboveVTT.

### AboveVTT Integration

tbd
