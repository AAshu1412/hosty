import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ApiStoreState {
    authorizationToken: string | null;


}

export const apiStore = create<ApiStoreState>()(devtools((set, get) => ({

    authorizationToken:null,
    setAuthorizationToken: (token: string) => set({ authorizationToken: token }),
    storetokenInLS: ()=>{
        if(get().authorizationToken){
            localStorage.setItem('github_token', get().authorizationToken as string);
        }
    },

github_callback: async (code: string) => {
    const response = await fetch('http://localhost:5000/api/github/callback', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
    });
    const data = await response.json();
    return data;
},

user: async () => {
    const response = await fetch('http://localhost:5000/api/github/user', {
        method: 'GET',
        headers: { "Authorization": `Bearer ${localStorage.getItem('github_token')}` },
    });
    const data = await response.json();
    return data;
},



})));
