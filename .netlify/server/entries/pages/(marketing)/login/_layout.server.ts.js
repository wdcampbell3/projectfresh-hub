const load = async ({
  locals: { session },
  cookies,
  url
}) => {
  return {
    url: url.origin,
    cookies: cookies.getAll(),
    session
  };
};
export {
  load
};
