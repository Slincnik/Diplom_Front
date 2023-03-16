import { Centrifuge } from "centrifuge";
import useUserStore from "@/modules/auth/stores/user";

const centrifuge = new Centrifuge(import.meta.env.VITE_CENTRA_URL, {
  websocket: WebSocket,
  debug: true,
  getToken: () => {
    const userStore = useUserStore();
    return new Promise(resolve => {
      resolve(userStore.user?.cent_token as string);
    });
  },
});

const options = {
  load: false,
  instance: centrifuge,
  connect: (id: number) => {
    const subs = centrifuge.newSubscription(`personal:#${id}`);

    subs.on("publication", ({ data }) => {
      console.log(data);
    });

    subs.subscribe();
    centrifuge.connect();

    // TODO: Подумать как сделать обработку ошибок, вдруг не подрубились
    options.load = true;
    centrifuge.on("error", ctx => {
      console.error(ctx);
    });
  },
};

export default options;
