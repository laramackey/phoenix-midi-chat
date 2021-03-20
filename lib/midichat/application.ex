defmodule Midichat.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Midichat.Repo,
      # Start the Telemetry supervisor
      MidichatWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Midichat.PubSub},
      # Start the Endpoint (http/https)
      MidichatWeb.Endpoint
      # Start a worker by calling: Midichat.Worker.start_link(arg)
      # {Midichat.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Midichat.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    MidichatWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
