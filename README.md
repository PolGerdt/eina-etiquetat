# eina-etiquetat
Eina per la creació de bases de dades de vídeos.

Utilitza el boilerplate amb [electron+react+webpack](https://github.com/alexdevero/electron-react-webpack-boilerplate) de l’[Alex Devero](https://github.com/alexdevero).

Per fer una build:

1. Descarregar el projecte.
2. ```npm install``` per instal·lar tots els mòduls.
3. ```npm run package``` per crear l’aplicació per al sistema que s’està utilitzant en una carpeta build al mateix projecte.

Per utilitzar l'aplicació es necessita:

1. La cerca de vídeos utilitza la [API de Youtube](https://developers.google.com/youtube/v3/getting-started) per tant es necessari tenir una clau o crear-la.
2. Per utilitzar les funcions d'extracció de fotogrames i segments es necessari tenir instal·lada la llibreria [ffmpeg](https://ffmpeg.org/) i afegir la ruta de la carpeta instal·lada al PATH.
