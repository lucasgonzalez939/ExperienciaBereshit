# Experiencia Bereshit - Juegos Matemáticos

Página web de juegos educativos para el evento escolar "Experiencia Bereshit".

## Estructura del Proyecto

```
ExperienciaBereshit/
├── index.html              # Página principal con selector de grados
├── css/
│   ├── styles.css         # Estilos para la página principal
│   └── game.css           # Estilos para las páginas de juegos
├── js/
│   ├── main.js            # JavaScript principal
│   ├── utils.js           # Funciones utilitarias
│   └── games/
│       └── galaxy-math-defender.js  # Juego Defensor Galáctico
└── games/
    ├── grado1.html        # Primer Grado - Defensor Galáctico (Fácil)
    ├── grado2.html        # Segundo Grado - Defensor Galáctico (Medio)
    ├── grado3.html        # Tercer Grado - Próximamente
    └── grado4.html        # Cuarto Grado - Próximamente
```

## Juegos Implementados

### Primer y Segundo Grado: Defensor Galáctico

Un juego tipo "space shooter" donde los estudiantes practican operaciones matemáticas.

**Primer Grado:**
- Dificultad: Fácil
- Operaciones: Suma y Resta
- Números: 0-10

**Segundo Grado:**
- Dificultad: Media
- Operaciones: Suma, Resta y Multiplicación
- Números: 0-20

**Cómo Jugar:**
1. Se muestra un problema matemático en la parte superior
2. Aparecen naves enemigas con diferentes números
3. El jugador debe disparar a la nave con la respuesta correcta
4. Usar teclas de flecha ←→ o botones para mover
5. Usar espacio o botón "Disparar" para disparar

**Controles:**
- Teclado: Flechas izquierda/derecha para mover, Espacio para disparar
- Botones: ◀ ▶ para mover, botón "Disparar" para disparar

## Características

- **Diseño Responsivo**: Funciona en computadoras, tablets y móviles
- **Interfaz en Español**: Todo el contenido está en español
- **Animaciones Suaves**: Transiciones y efectos visuales atractivos
- **Controles Accesibles**: Soporte para teclado y táctil

## Próximos Pasos

- [ ] Implementar juego para Tercer Grado
- [ ] Implementar juego para Cuarto Grado
- [ ] Agregar efectos de sonido
- [ ] Agregar sistema de puntuación global
- [ ] Agregar certificados de logros

## Modificaciones Futuras

Para agregar más juegos o modificar los existentes:

1. **Crear nuevo juego**: Agregar archivo en `js/games/`
2. **Crear página del juego**: Agregar HTML en `games/`
3. **Actualizar dificultad**: Modificar parámetros en las páginas HTML:
   ```javascript
   const game = new NombreDelJuego(gameArea, {
       difficulty: 'easy',  // easy, medium, hard
       maxNumber: 10,       // rango máximo de números
       operations: ['+', '-'] // operaciones permitidas
   });
   ```

## Tecnologías Utilizadas

- HTML5
- CSS3 (con animaciones y gradientes)
- JavaScript (ES6+)
- Canvas API (para el juego)

## Autor

Desarrollado para el evento escolar "Experiencia Bereshit"

---

**Nota**: Este proyecto está en desarrollo activo. Los juegos para Tercer y Cuarto Grado serán agregados próximamente.
