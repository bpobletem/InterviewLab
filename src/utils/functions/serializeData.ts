// Definimos un tipo para los valores que puede manejar la función
type SerializableValue =
  | null
  | string
  | number
  | boolean
  | Date
  | bigint
  | { [key: string]: SerializableValue }
  | SerializableValue[];

// Función auxiliar para serializar datos
export function serializeData<T extends SerializableValue>(obj: T): T {
  // Manejo de casos base: null, primitivos, o Date
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }

  // Manejo de arrays
  if (Array.isArray(obj)) {
    return obj.map(serializeData) as T;
  }

  // Manejo de objetos
  const newObj: { [key: string]: SerializableValue } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'bigint') {
        newObj[key] = value.toString();
      } else if (value instanceof Date) {
        newObj[key] = value;
      } else {
        newObj[key] = serializeData(value);
      }
    }
  }

  return newObj as T;
}