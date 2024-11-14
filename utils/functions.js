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


const getIconByType = (type) => {
  switch (type) {
    case "Tourism":
      return "person-walking";
    case "Museum":
      return "building-columns";
    case "Cinema":
      return "film";
    case "Theater":
      return "masks-theater";
    case "Park":
      return "tree";
    case "Education":
      return "graduation-cap";
    default:
      return "map-pin"; // Icône par défaut
  }
};

export { getColorByType, getIconByType };
