import ProjectContent from "./ProjectContent";

type Props = {
  params: Promise<{ id: string }>;
};

const Project = async ({ params }: Props) => {
  const { id } = await params;

  return <ProjectContent id={id} />;
};

export default Project;