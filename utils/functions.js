// Fonction pour déterminer la couleur selon le type de lieu
const getColorByType = (type) => {
  switch (type) {
    case "Monument Historique":
      return "red";
    case "Musée":
      return "blue";
    case "Parc d'Attractions":
      return "yellow";
    case "Zoo":
      return "green";
    case "Parc Naturel":
      return "brown";
    case "Aquarium":
      return "aqua";
    case "Stade":
      return "orange";
    default:
      return "gray"; // Couleur par défaut
  }
};

export { getColorByType };
