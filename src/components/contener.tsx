interface Props {
children: React.ReactNode;
className?: String;
}

export const Contener = ({children, className}: Props ) => {
    return (
        <div className={`w-full max-w-7xl mx-auto lg:px-10 md:px-4 ${className}`}>
            {children}
        </div>
    );
};