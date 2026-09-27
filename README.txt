EXPEDIENTE QX — Registro privado de pacientes

Backend: Supabase rkqpohqdwiwbkbafkxnr
URL: https://rkqpohqdwiwbkbafkxnr.supabase.co

IMPORTANTE:
- La aplicación usa Supabase Auth y RLS.
- Debe existir un usuario autenticado en Supabase Auth antes de guardar datos en línea.
- No hacer público el bucket pacientes-fotos.
- No introducir nunca una service_role key en index.html.

Archivos:
- index.html: aplicación
- manifest.json: PWA
- sw.js: caché de la aplicación; no almacena datos clínicos de Supabase
