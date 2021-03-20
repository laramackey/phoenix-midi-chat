defmodule MidichatWeb.PianoChannel do
  use MidichatWeb, :channel

  @impl true
  def join("piano:lobby", _payload, socket) do
    {:ok, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (piano:lobby).
  @impl true
  def handle_in("play", payload, socket) do
    broadcast socket, "play", payload
    {:noreply, socket}
  end
  def handle_in("stop", payload, socket) do
    broadcast socket, "stop", payload
    {:noreply, socket}
  end
  def handle_in("newJoiner", payload, socket) do
    broadcast socket, "newJoiner", payload
    {:noreply, socket}
  end

end
