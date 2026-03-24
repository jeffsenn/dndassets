# dndassets
Personal Assets for Virtual Tabletop

This is a demo repository for hosting semi-public links to assets for my virtual tabletop.

I would like to share assets with players for my game - and the links need to be available without a complicated login process.

This is NOT SECURE!  It is intended for a website that has "security through obscurity" level privacy.  All assets are available if you know the URL.

I use this for the spectacular AboveVTT web extension.

If you do not want to go to the trouble of setting up stuff yourself, there are benefits to the 
AboveVTT patreon (https://www.patreon.com/abovevtt) and you should probably check out the AboveVTT Discord (https://discord.gg/cMkYKqGzRh) for other options.


## Setup a Website

### At CloudFlare

-- You'll need a CloudFlare account
-- Go to Workers & Pages > Create application 
-- Click Connect to Github, jump through authentication hoops (may vary depending on how you have Github setup)
-- Select your GitHub repo (you probably want your repo private)
-- Accept all the defaults (eg Leave "Build Command" empty)
-- Click "Save and Deploy"

Theoretically this does everything to redeploy your site when you push to your repo.  However on a free account you may be limited in number of deployments in a time period, so commit judiciously.

