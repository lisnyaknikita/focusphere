import { Client, Teams, Users } from 'node-appwrite'

export const adminClient = new Client()
	.setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
	.setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
	.setKey(process.env.APPWRITE_ADMIN_KEY || 'dummy_key_for_build')

export const adminUsers = new Users(adminClient)
export const adminTeams = new Teams(adminClient)
