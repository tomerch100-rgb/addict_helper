import { useState, useEffect } from "react";

function useFetchData(apiFunction, dependencies = [], initialValue = []) {

    const [data, setData] = useState(initialValue)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null);

    useEffect(() => {

        const fetchMyData = async () => {
            setError(null)
            try {
                const data = await apiFunction()
                setData(data)
            } catch (error) {
                console.error("לא הצלחנו למשוך את התיק", error)
                setError(error.message || "משהו השתבש בטעינת הנתונים");
            }
            finally {
                setIsLoading(false)


            }
        }
        fetchMyData();
        // dependencies is caller-supplied and intentionally spread so each
        // caller controls its own refetch triggers; apiFunction is expected
        // to be stable (memoized by the caller) rather than a dependency.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies])
    return { data, isLoading, error }

}

export default useFetchData