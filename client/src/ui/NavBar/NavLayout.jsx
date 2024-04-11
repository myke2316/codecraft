import NavItems from "./NavItems";

function NavLayout() {
  return (
    <ul className="flex m-auto justify-between max-w-6xl items-center text-sm text-textprimarycolor1">
      <NavItems />
    </ul>
  );
}
export default NavLayout;
