defmodule MidichatWeb.PianoChannel do
  use MidichatWeb, :channel

  @impl true
  def join("piano:lobby", _payload, socket) do
    {:ok, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (piano:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

end
