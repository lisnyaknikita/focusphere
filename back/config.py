from pydantic_settings import BaseSettings, SettingsConfigDict


class Config(BaseSettings):
    DB_PATH: str

    model_config = SettingsConfigDict(
        env_file='.env',
    )


config = Config()  # type: ignore
