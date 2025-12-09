import { Account, Client, Storage, TablesDB } from 'appwrite'

export const client = new Client()

client.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!).setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const account = new Account(client)
export const storage = new Storage(client)
export const db = new TablesDB(client)

export { ID } from 'appwrite'
