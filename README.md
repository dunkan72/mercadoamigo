# Mercado Amigo

Sitio web de avisos comunitarios.

## Flujo de Trabajo (Git Flow)

`
dev  →  qa  →  main
`

| Rama | Uso |
|------|-----|
| dev | Desarrollo - aquí se hacen todos los cambios |
| qa | Testing / Control de calidad - pruebas antes de producción |
| main | Producción - código estable en vivo |

### Proceso:

1. **Desarrollo:** Trabajar siempre en dev
2. **Testing:** Crear PR de dev → qa para pruebas
3. **Producción:** Crear PR de qa → main para publicar

### Reglas:
- No se permite push directo a main ni qa
- Se requiere Pull Request con al menos 1 aprobación
- Historial lineal obligatorio

## Credenciales Admin (por defecto)
- Usuario: dmin
- Contraseña: MercadoAmigo2026!

*Se recomienda cambiar las credenciales desde el panel de administración.*