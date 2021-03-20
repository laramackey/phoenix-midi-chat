defmodule MidichatWeb.PageController do
  use MidichatWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
