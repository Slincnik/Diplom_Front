import Centrifuge from "centrifuge/build/protobuf";
import useUserStore from "@/stores/user";
import type { Subscription } from "centrifuge";

const centrifuge = new Centrifuge(import.meta.env.VITE_CENTRA_URL, {
  name: "diplom",
  protocol: "protobuf",
  websocket: WebSocket,
  getToken() {
    const userStore = useUserStore();
    const user = userStore.user;

    return Promise.resolve(user!.cent_token);
  },
});

const options = {
  isLoaded: false,
  instance: centrifuge,
  channelSubscription: null as Subscription | null,
  connect: (id: number) => {
    options.channelSubscription = centrifuge.newSubscription(`user#${id}`);
    options.channelSubscription.subscribe();

    centrifuge.connect();

    // TODO: Подумать как сделать обработку ошибок, вдруг не подрубились
    options.isLoaded = true;
    centrifuge.on("error", ctx => {
      console.error(ctx);
    });
  },
};

export default options;
