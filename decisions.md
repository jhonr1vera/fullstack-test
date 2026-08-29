# DECISIONS

1. ¿Dónde vive la validación de las reglas de estado y por qué ahí?

   **Respuesta**: Para los estados del inmueble, las validaciones se manejan en el frontend y backend. El backend la maneja en la capa de servicio, ya que cuenta con la información completa del objeto para validar las transacciones admitidas en el contexto del sistema. Por otro lado, el frontend ya cuenta con la informacion del estado al hacer la solicitud completa de la lista, el proposito es mejorar la experiencia del usuario y evitar llamadas innecesarias al backend. Ambas evitan un mal manejo de la logica de negocio, consumo de recursos y un mal UX.

2. ¿Cómo garantizas que un usuario no pueda modificar recursos ajenos?

   **Respuesta**: Al momento de ejecutar las querys, se extrae, a traves del decorador, los datos provenientes del token del usuario (id). De esta manera, se esta comparando el identificador de propiedad del objeto a modificar para comprobar si puede editarlo o eliminarlo. Se utiliza Passport.

3. ¿Dónde guardas el token en el cliente y qué riesgo asumes?

   **Respuesta**: Estoy guardando el token en las cookies HTTPOnly. El proposito es evitar la mayor cantidad de riesgo posible ya que lo gestiona el motor del navegador. Al no tener el atributo secure activo no estaria cifrada al momento de enviar. Pero se puede activar en entornos productivos (Esta habilitada la opción pero podria dar fallos con la IP).

4. ¿Qué deuda técnica asumiste conscientemente por el límite de tiempo?

   **Respuesta**: Consciente del tiempo límite, decidí enfocarme en la estabilidad del backend y la corrección de las consultas a la base de datos. Asumí como deuda técnica no cubrir todas las pruebas del sistema de manera exhaustiva y las mejoras de la estetica de la vista. Sin embargo, la funcionalidad del sistema es buena.
