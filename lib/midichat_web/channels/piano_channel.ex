defmodule MidichatWeb.PianoChannel do
  use MidichatWeb, :channel

  alias MidichatWeb.Presence

  @impl true
  def join("piano:lobby", payload, socket) do
    send(self(), :after_join)
    {:ok, assign(socket, :user_name, payload)}
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

  def handle_info(:after_join, socket) do
    {:ok, _} = Presence.track(socket, socket.assigns.user_token, %{
      user_name: socket.assigns.user_name,
      online_at: inspect(System.system_time(:second))
    })

    push(socket, "presence_state", Presence.list(socket))
    {:noreply, socket}
  end

end
