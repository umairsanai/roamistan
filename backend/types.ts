export type SignupRequestBody = {
    name: string
    email: string
    city: string
    country: string
    password: string
}

export type LoginRequestBody = {
    email: string
    password: string
}

export type LocationMatcherType = {
    title: string
    description: string
}

declare global {
    namespace Express {
        interface User {
            user_id: number
            name: string
            email: string
            city: string
            country: string
            profile_url: string
            googleAccessToken?: string
            googleRefreshToken?: string
            googleProfile?: any
        }
    }
}

