defmodule Midichat.Repo do
  use Ecto.Repo,
    otp_app: :midichat,
    adapter: Ecto.Adapters.Postgres
end
