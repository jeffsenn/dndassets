# dndassets
Somewhat Secured Personal Assets (for Virtual Tabletop or other purposes)

This is a repository for hosting semi-private links to assets for my virtual tabletop. My own repo is private.  This is a template so that you can clone and roll your own.

I would like to share assets with players for my game - and the links need to be available without a complicated login process.

This is NOT SECURE!  It is intended only for a website that has "security through obscurity" level privacy.  All assets are available if you know the URL. (But this is really what we want!)

## AboveVTT

I use this for the (spectacular) AboveVTT web extension https://github.com/cyruzzo/AboveVTT so that I have a source of URLs for image assets for maps and tokens.

If you do not want to go to the trouble of setting up stuff yourself, and you need cloud available storage, there are other options (dropbox... etc) and there may also be benefits to the AboveVTT patreon (https://www.patreon.com/abovevtt). You should probably check out the AboveVTT Discord (https://discord.gg/cMkYKqGzRh) for other options.


## Setup a Website

### Using this repo

1. Fork this repo on Github (or make a clone and then push it to your own origin)
1. Put copies of the resources you want into the `sources` directory -- use descriptive file names
1. You can make a tree of files.
1. Note that these source files are not committed as they are, but "encrypted" filename copies are made and committed.
1. Create a passphrase in `passphrase.txt` (this is for the admin, not "users")
1. use `node update.js` to build and commit the site back to your repo
1.  (This requires a command line git available to node, alternatively manually commit)
1. deploy your website from the committed repo (one option is CloudFlare)

Note: CloudFlare Pages does not present "directory style" pages for folder URLs -- make sure how ever you deploy does not provide this or the whole "security" mechanism here will just not work.  e.g. if users can see a directory: https://your-website.link/images/ then they can just see everything.

### At CloudFlare

1. You'll need a CloudFlare account
1. Go to Workers & Pages > Create application 
1. Click Connect to Github, jump through authentication hoops (may vary depending on how you have Github setup)
1. Select your GitHub repo (you probably want your repo private)
1. Accept all the defaults (eg Leave "Build Command" empty)
1. Click "Save and Deploy"

Theoretically this does everything to redeploy your site each time when you push to your repo.  However on a free account you may be limited in number of deployments in a time period, so commit judiciously.

### Updating/Adding Resources

1. Just update `sources/` directory 
1. Re-run `node update.js`  (copies files from `sources/` -> `images/`)

### Changing password

1. Change `passphrase.txt`
1. Re-run `node update.js`

### How it works

The script assigns names to the image/resource files (based on their hash) and them moves them to the `images` directory.  It keeps a local (not committed) secret version of the index (with previous file names) in `secretindex.txt`.  This index is encrypted with the passphrase and deployed in `index.txt` with the website.  The script on the page will use a user entered passphrase to decrypt the index.

Of course only the admin needs the index -- direct links to the resources work as usual.

There is also some integration stuff (iframe message interaction) that is used to interact with AboveVTT - but you can ignore that if you are not using AboveVTT.

### The user experience

If you navigate to the bare site URL, it will prompt you for the passphrase -- only if you know it (you are probably the "admin") then you can get the index of assets (with original filenames).  There is a checkbox to save the password (in browser local storage) so you don't have to type it all the time.  Clicking on a link will go to the bare "encrypted" URL.  If you are a tool wanting to save those links, then of course you can use the provided URL which should work in any context.

### AboveVTT Integration

When the page navigates it posts a message to the parent window with the url so that the parent (Presumably someone who is loading this in an iframe) can see what URL is "selected".

