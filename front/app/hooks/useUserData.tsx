import { useState, useEffect } from "react";
import { useAuth } from '../hooks/useAuth';
import { getUserByEmail } from '../services/userDash/authservices';
import nookies from "nookies";
import { useRouter } from "next/navigation";

const useUserData = () => {
    const { isAuthenticated } = useAuth();
    const [userName, setUserName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const cookies = nookies.get(null);
                const email = cookies.email;

                if (email) {
                    const decodedEmail = decodeURIComponent(email);
                    const user = await getUserByEmail(decodedEmail);
                    if (user?.usuario) {
                        setUserName(user.usuario.name);
                    } else {
                        router.push("/pages/noneUser");
                    }
                } else {
                    router.push("/pages/noneUser");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                router.push("/pages/noneUser");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchUserData();
        }
    }, [isAuthenticated, router]);

    return { userName, loading };
};

export default useUserData;
