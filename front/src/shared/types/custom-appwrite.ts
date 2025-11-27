import { Models } from 'appwrite'

export interface CustomPreferences extends Models.Preferences {
	avatarId?: string
}

export interface CustomUser extends Omit<Models.User<Models.Preferences>, 'prefs'>, Models.User<CustomPreferences> {}
