import { useContext } from "react";
import UserContext from "./UserContext";

function Home() {

    const userInfo = useContext(UserContext);

    if (!userInfo.email) {
        return 'Melden Sie sich bitte an, um diesen Inhalt zu sehen!'
    }

    return <div>
        Home
    </div>
}

export default Home;