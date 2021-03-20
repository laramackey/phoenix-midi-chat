# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :midichat,
  ecto_repos: [Midichat.Repo]

# Configures the endpoint
config :midichat, MidichatWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "D2STeqVPsksRhcp6/ZCEFov67oynnCXPHO2alVSkBpmv+uOO/tfNuildyrn4qSh2",
  render_errors: [view: MidichatWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Midichat.PubSub,
  live_view: [signing_salt: "wn9LUC1U"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
