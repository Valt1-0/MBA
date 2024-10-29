// Fonction pour déterminer la couleur selon le type de lieu
const getColorByType = (type) => {
  switch (type) {
    case "Tourism":
      return "red";
    case "Museum":
      return "blue";
    case "Cinema":
      return "yellow";
    case "Theater":
      return "green";
    case "Park":
      return "brown";
    case "Education":
      return "aqua";
    default:
      return "gray"; // Couleur par défaut
  }
};

export { getColorByType };
