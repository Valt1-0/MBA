import { Redirect } from "expo-router"
import { Text } from "react-native"

const index = () => {


    return (
      <Redirect href={"/splashscreen"}/>
    );
 }
export default index;